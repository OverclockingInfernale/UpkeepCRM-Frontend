export function useApiFetch<T = unknown>(url:string, options: any = {}){
    return useFetch<T>(`/api/${url}`, {
        method: 'GET',
        ...options,
    })
}