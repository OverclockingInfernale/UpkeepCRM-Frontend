<script setup>
import { ref, computed, nextTick } from 'vue';
const { data: messagesRaw, refresh } = await useFetch('/api/getTelegramMessages');
const sending = ref({});
const newMessages = ref({});
const selectedChatId = ref(null);

onMounted(() => {
  const interval = setInterval(() => refresh(), 5000);
  onUnmounted(() => clearInterval(interval));
});

const chatNames = computed(() => {
  const names = {};
  for (const chatId in chats.value) {
    const latest = chats.value[chatId].find(message => !message.fromMe); // Already sorted from your backend
    names[chatId] = latest.name || chatId;
  }
  return names;
});


const selectChat = (id) => {
  selectedChatId.value = id;
};

// Computed messages for selected chat
const selectedChatMessages = computed(() => {
  return chats.value[selectedChatId.value] || [];
});


// Group by chatId
const chats = computed(() => {
  const groups = {};
  for (const msg of messagesRaw.value || []) {
    const id = msg.chatId;
    if (!groups[id]) groups[id] = [];
    groups[id].push(msg);
  }
  return groups;
});

const sendMessage = async (chatId) => {
  const text = newMessages.value[chatId];
  if (!text?.trim()) return;
  sending.value[chatId] = true;

  await $fetch('/api/postTelegramMessage', {
    method: 'POST',
    body: { chatId, text },
  });

  newMessages.value[chatId] = '';
  sending.value[chatId] = false;
  await refresh();
};
</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="w-64 border">
      <div class="p-4 text-xl font-semibold text-primary">💬 Chats</div>
      <ul>
        <li
            v-for="chatId in Object.keys(chats)"
            :key="chatId"
            @click="selectChat(chatId)"
            :class="[
            'cursor-pointer px-4 py-3 border-b border-surface-200 dark:border-surface-700 hover:bg-surface-200 app-dark:hover:bg-surface-800 transition-colors',
            selectedChatId === chatId ? 'bg-primary text-white' : 'text-color'
          ]"
        >
          {{ chatNames[chatId] || chatId }}
        </li>
      </ul>
    </div>

    <!-- Chat Panel -->
    <div class="flex-1 flex flex-col">
      <ScrollPanel class="flex-1 p-4 overflow-y-auto" style="flex-direction: column-reverse;">
        <div class="flex flex-col-reverse gap-3">
          <div
              v-for="msg in selectedChatMessages"
              :key="msg.id"
              :class="['flex', msg.fromMe ? 'justify-end' : 'justify-start']"
          >
            <Card
                :class="[
                'max-w-xs break-words',
                msg.fromMe ? 'bg-primary text-white' : 'text-color'
              ]"
            >
              <template #content>
                <div>{{ msg.message }}</div>
                <div class="text-xs text-color-secondary mt-1">
                  {{ new Date(msg.time).toLocaleString() }}
                </div>
              </template>
            </Card>
          </div>
        </div>
      </ScrollPanel>

      <!-- Input Area -->
      <div v-if="selectedChatId" class="p-4 border-t border-surface-200 flex gap-2 items-center bg-surface-0">
        <InputText
            v-model="newMessages[selectedChatId]"
            class="flex-1"
            placeholder="Type a message..."
            @keydown.enter="sendMessage(selectedChatId)"
        />
        <Button
            label="Send"
            icon="pi pi-send"
            :loading="sending[selectedChatId]"
            @click="sendMessage(selectedChatId)"
        />
      </div>
    </div>
  </div>
</template>


