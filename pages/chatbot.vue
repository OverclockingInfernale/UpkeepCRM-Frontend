<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import TdClient from 'tdweb';

/** Интерфейс для общего описания чата */
interface Chat {
  id: number;
  title: string;
  username: string;
  first_name: string;
  last_name: string;
  last_message_preview: string;
}

/** Интерфейс для отформатированного сообщения */
interface FormattedMessage {
  id: number;
  chat_id: number;
  isOutgoing: boolean;
  date: number;
  text: string | null;
  photo: string | null;
}

export default defineComponent({
  name: 'Chats',
  setup() {
    // TDLib-клиент (объект, возвращаемый TdClient)
    const tdClient = ref<any>(null);

    // Список чатов
    const chats = ref<Chat[]>([]);
    const chatsLoaded = ref<boolean>(false);

    // Выбранный чат
    const selectedChat = ref<Chat | null>(null);

    // История сообщений
    const messages = ref<FormattedMessage[]>([]);
    const loadingHistory = ref<boolean>(false);

    // Новый текст сообщения
    const newMessageText = ref<string>('');

    // Ваш Bot-token (замените на свой)
    const botToken = ref<string>('<ВАШ_BOT_TOKEN>');

    // Ваш api_id и api_hash (замените на свои)
    const apiId = ref<number>(7651268106); // <ВАШ_API_ID>
    const apiHash = ref<string>('AAG1m93Wv3PMRdjM3Ja17s_JDS3ySb8YAuY');

    // Для пагинации истории
    const historyOffsetMessageId = ref<number>(0);
    const historyLimit = ref<number>(50);

    // Обработчик апдейтов TDLib
    const updateHandler = ref<((update: any) => void) | null>(null);

    // Ссылка на контейнер с историей (для скролла)
    const historyContainer = ref<HTMLElement | null>(null);

    /**
     * Инициализируем TDLib-клиент и авторизуем бот-токеном
     */
    const initTdClient = async (): Promise<void> => {
      // Конфигурация TDWeb
      const log = (msg: string) => {
        // Для отладки можно раскомментировать:
        // console.log('[TDLib]', msg);
      };

      tdClient.value = new TdClient({
        apiId: apiId.value,
        apiHash: apiHash.value,
        useLog: false,
        log,
        databaseDirectory: 'tdlib-db', // IndexedDB-папка
      });

      // Подписываемся на входящие update-события
      updateHandler.value = (update: any) => {
        onTdUpdate(update);
      };
      tdClient.value.on('update', updateHandler.value);

      // Ждём готовности TDLib
      await tdClient.value.ready;

      // Авторизация бот-токеном
      await tdClient.value.send({
        '@type': 'setAuthenticationBotToken',
        token: botToken.value.trim(),
      });

      // После этого TDLib пришлёт updateAuthorizationState с 'authorizationStateReady'
    };

    /**
     * Загружает список чатов (диалогов), в которых участвует бот
     */
    const loadChats = async (): Promise<void> => {
      if (!tdClient.value) return;

      // Первый вызов getChats: берём первые 100 чатов
      const res = await tdClient.value.send({
        '@type': 'getChats',
        offset_order: '9223372036854775807',
        offset_chat_id: 0,
        limit: 100,
      });

      const chatIds: number[] = res.chat_ids || [];
      const chatPromises = chatIds.map((chatId: number) =>
          tdClient.value.send({
            '@type': 'getChat',
            chat_id: chatId,
          })
      );

      const chatInfos: any[] = await Promise.all(chatPromises);

      // Форматируем каждый chatInfo
      chats.value = chatInfos.map((chat: any) => {
        let title = '';
        if (chat.type['@type'] === 'chatTypePrivate') {
          title = (chat.type.user_id
              ? `${chat.first_name || ''} ${chat.last_name || ''}`.trim()
              : chat.title);
        } else {
          title = chat.title || 'Без названия';
        }

        return {
          id: chat.id,
          title,
          username: chat.type['@type'] === 'chatTypePrivate' ? chat.type.username || '' : '',
          first_name: chat.first_name || '',
          last_name: chat.last_name || '',
          last_message_preview: chat.last_message
              ? chat.last_message.content.text
                  ? chat.last_message.content.text.text
                  : ''
              : '',
        } as Chat;
      });

      chatsLoaded.value = true;
    };

    /**
     * Обработчик всех входящих update-ов от TDLib.
     */
    const onTdUpdate = async (update: any): Promise<void> => {
      // 1) Авторизация завершена
      if (update['@type'] === 'updateAuthorizationState') {
        const state = update.authorization_state['@type'];
        if (state === 'authorizationStateReady') {
          // Загружаем чаты
          await loadChats();
        }
      }

      // 2) Новое сообщение
      if (update['@type'] === 'updateNewMessage') {
        const msg = update.message;
        // Если сообщение относится к открытому чату, добавляем в историю
        if (selectedChat.value && msg.chat_id === selectedChat.value.id) {
          const formatted = await formatTdMessage(msg);
          messages.value.push(formatted);
          await nextTick();
          scrollToBottom();
        }
        // Обновляем превью последнего сообщения в списке чатов
        const chatIdx = chats.value.findIndex((c) => c.id === msg.chat_id);
        if (chatIdx !== -1) {
          const textPreview = msg.content.text ? msg.content.text.text : '[медиа]';
          chats.value[chatIdx].last_message_preview = textPreview;
        }
      }

      // 3) Удаление сообщений
      if (update['@type'] === 'updateDeleteMessages') {
        const { chat_id, message_ids } = update;
        if (selectedChat.value && chat_id === selectedChat.value.id) {
          messages.value = messages.value.filter((m) => !message_ids.includes(m.id));
        }
      }
    };

    /**
     * Приводит raw-объект message из TDLib к удобному формату
     */
    const formatTdMessage = async (msg: any): Promise<FormattedMessage> => {
      const base: FormattedMessage = {
        id: msg.id,
        chat_id: msg.chat_id,
        isOutgoing: msg.is_outgoing,
        date: msg.date,
        text: null,
        photo: null,
      };

      // Текстовое сообщение
      if (msg.content['@type'] === 'messageText') {
        base.text = msg.content.text.text;
      }
      // Фото
      else if (msg.content['@type'] === 'messagePhoto') {
        const photoSizes = msg.content.photo.sizes;
        const largest = photoSizes[photoSizes.length - 1];
        const fileId = largest.photo.remote ? largest.photo.remote.id : null;
        if (fileId && tdClient.value) {
          const fileRes = await tdClient.value.send({
            '@type': 'getFile',
            file_id: fileId,
            priority: 1,
          });
          base.photo = fileRes.local ? fileRes.local.path : null;
        }
      }

      return base;
    };

    /**
     * При выборе чата загружаем историю сообщений
     */
    const selectChat = async (chat: Chat): Promise<void> => {
      if (selectedChat.value && selectedChat.value.id === chat.id) return;

      selectedChat.value = chat;
      messages.value = [];
      historyOffsetMessageId.value = 0;
      loadingHistory.value = true;

      if (!tdClient.value) return;

      const hist: any = await tdClient.value.send({
        '@type': 'getChatHistory',
        chat_id: chat.id,
        from_message_id: 0,
        offset: 0,
        limit: historyLimit.value,
        only_local: false,
      });

      // Сообщения приходят от новых к старым, разворачиваем
      const reversed: any[] = hist.messages.reverse();

      for (const raw of reversed) {
        const fm = await formatTdMessage(raw);
        messages.value.push(fm);
      }

      if (reversed.length > 0) {
        historyOffsetMessageId.value = reversed[0].id;
      }
      loadingHistory.value = false;

      await nextTick();
      scrollToBottom();
    };

    /**
     * Отправка текстового сообщения
     */
    const sendTextMessage = async (): Promise<void> => {
      const text = newMessageText.value.trim();
      if (!text || !selectedChat.value || !tdClient.value) return;

      await tdClient.value.send({
        '@type': 'sendMessage',
        chat_id: selectedChat.value.id,
        input_message_content: {
          '@type': 'inputMessageText',
          text: { '@type': 'formattedText', text },
        },
      });

      newMessageText.value = '';
    };

    /**
     * Триггер для клика по скрытому file-input
     */
    const triggerFileInput = (): void => {
      const inputEl = fileInput.value;
      if (inputEl) {
        inputEl.click();
      }
    };

    // Ссылка на <input type="file">
    const fileInput = ref<HTMLInputElement | null>(null);

    /**
     * Отправка фото
     */
    const sendPhotoMessage = async (event: Event): Promise<void> => {
      const target = event.target as HTMLInputElement;
      const file = target.files && target.files[0];
      if (!file || !selectedChat.value || !tdClient.value) return;

      // Загружаем файл в TDLib
      const uploadRes: any = await tdClient.value.send({
        '@type': 'uploadFile',
        file: { '@type': 'local', path: file },
        priority: 1,
      });
      const fileId = uploadRes.id;

      // Отправляем сообщение с фотографией
      await tdClient.value.send({
        '@type': 'sendMessage',
        chat_id: selectedChat.value.id,
        input_message_content: {
          '@type': 'inputMessagePhoto',
          photo: { '@type': 'inputFileLocal', id: fileId },
          caption: '',
        },
      });

      // Очищаем input
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    /**
     * Удаление сообщения (только своих)
     */
    const deleteMessage = async (message: FormattedMessage): Promise<void> => {
      if (!selectedChat.value || !tdClient.value) return;
      // Можно подтвердить удаление через confirm
      if (!confirm('Вы точно хотите удалить это сообщение?')) return;

      await tdClient.value.send({
        '@type': 'deleteMessages',
        chat_id: selectedChat.value.id,
        message_ids: [message.id],
        revoke: true,
      });
      // После этого TDLib пришлёт updateDeleteMessages
    };

    /**
     * Скролл контейнера истории вниз
     */
    const scrollToBottom = (): void => {
      if (historyContainer.value) {
        historyContainer.value.scrollTop = historyContainer.value.scrollHeight;
      }
    };

    /**
     * Форматирование UNIX-времени в строку "DD.MM.YYYY HH:MM"
     */
    const formatDate = (timestampMs: number): string => {
      const d = new Date(timestampMs);
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      const dd = d.getDate().toString().padStart(2, '0');
      const mo = (d.getMonth() + 1).toString().padStart(2, '0');
      const yy = d.getFullYear();
      return `${dd}.${mo}.${yy} ${hh}:${mm}`;
    };

    onMounted(async () => {
      await initTdClient();
      // После авторизации TDLib вызовет onTdUpdate и загрузит чаты
    });

    onBeforeUnmount(() => {
      if (tdClient.value && updateHandler.value) {
        tdClient.value.off('update', updateHandler.value);
      }
    });

    return {
      chats,
      chatsLoaded,
      selectedChat,
      messages,
      loadingHistory,
      newMessageText,
      selectChat,
      sendTextMessage,
      triggerFileInput,
      sendPhotoMessage,
      deleteMessage,
      formatDate,
      historyContainer,
      fileInput,
    };
  },
});
</script>

<template>
  <div class="chats-container flex h-full">
    <!-- Левое меню: список чатов -->
    <aside class="w-1/4 border-r overflow-y-auto">
      <div class="p-4">
        <h2 class="text-xl font-semibold mb-2">Чаты бота</h2>
        <!-- Если ещё не загружены чаты -->
        <div v-if="!chatsLoaded" class="text-gray-500">Загрузка списка...</div>
        <!-- Список чатов -->
        <ul v-else>
          <li
              v-for="chat in chats"
              :key="chat.id"
              @click="selectChat(chat)"
              :class="[
              'p-2 rounded cursor-pointer mb-1',
              { 'bg-blue-100': selectedChat && selectedChat.id === chat.id }
            ]"
          >
            <div class="font-medium">
              {{ chat.title || chat.username || chat.first_name + ' ' + (chat.last_name || '') }}
            </div>
            <div class="text-sm text-gray-600">{{ chat.last_message_preview }}</div>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Правая панель: сообщения выбранного чата -->
    <section class="w-3/4 flex flex-col">
      <div class="p-4 border-b flex items-center justify-between">
        <div v-if="selectedChat">
          <h2 class="text-2xl font-semibold">
            {{ selectedChat.title || selectedChat.username || selectedChat.first_name + ' ' + (selectedChat.last_name || '') }}
          </h2>
          <div class="text-sm text-gray-600">Chat ID: {{ selectedChat.id }}</div>
        </div>
        <div v-else class="text-gray-500">Выберите чат слева</div>
      </div>

      <!-- История сообщений -->
      <div class="flex-1 overflow-y-auto p-4" ref="historyContainer">
        <div v-if="!selectedChat" class="text-gray-500">Нечего показывать</div>
        <div v-else>
          <div v-if="loadingHistory" class="text-gray-500">Загрузка истории...</div>
          <div v-else>
            <div
                v-for="message in messages"
                :key="message.id"
                class="mb-4 flex"
                :class="message.isOutgoing ? 'justify-end' : 'justify-start'"
            >
              <div
                  class="max-w-xs p-2 rounded-lg"
                  :class="message.isOutgoing ? 'bg-blue-200 text-right' : 'bg-gray-200 text-left'"
              >
                <!-- Если текстовое сообщение -->
                <div v-if="message.text">{{ message.text }}</div>

                <!-- Если это фото -->
                <div v-else-if="message.photo">
                  <img
                      :src="message.photo"
                      alt="Требуется загрузить фото..."
                      class="max-w-full max-h-64 rounded"
                  />
                </div>

                <div class="text-xs text-gray-500 mt-1">
                  {{ formatDate(message.date * 1000) }}
                </div>
                <!-- Кнопка удаления (только для своих сообщений) -->
                <button
                    v-if="message.isOutgoing"
                    @click="deleteMessage(message)"
                    class="text-red-600 text-xs mt-1 hover:underline"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Блок ввода нового сообщения -->
      <div class="p-4 border-t">
        <div v-if="selectedChat" class="flex items-center space-x-2">
          <input
              v-model="newMessageText"
              @keyup.enter="sendTextMessage"
              type="text"
              placeholder="Введите сообщение..."
              class="flex-1 border rounded px-3 py-2 focus:outline-none"
          />
          <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="sendPhotoMessage"
              class="hidden"
          />
          <button @click="triggerFileInput" class="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
            📷
          </button>
          <button
              @click="sendTextMessage"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Отправить
          </button>
        </div>
        <div v-else class="text-gray-500">Выберите чат, чтобы писать сообщение</div>
      </div>
    </section>
  </div>
</template>


<style scoped>
.chats-container {
  height: 100%;
}

/* Дополнительные стили при необходимости */
</style>

