export const PILL_TAB_CLASS = [
  'rounded-full px-4 py-1.5 font-medium transition-colors whitespace-nowrap',
  'bg-neutral-200/60 text-neutral-700 hover:bg-neutral-200 hover:opacity-100',
  'dark:border dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10',
  'data-[selected=true]:bg-[#c5d86d] data-[selected=true]:text-neutral-900 data-[selected=true]:font-bold data-[selected=true]:shadow-sm',
  'dark:data-[selected=true]:bg-[#c5d86d] dark:data-[selected=true]:text-neutral-900',
].join(' ')

/**
 * Lista de pestañas píldora.
 *
 * `.tabs__list` de HeroUI mide `w-max min-w-full`, así que crece con el
 * contenido y desborda la tarjeta en mobile (el `overflow-x: hidden` del body
 * corta la última pestaña). `max-w-full` es la pieza clave: sin ese tope la
 * lista mide su `max-content` y el `overflow-x-auto` nunca encuentra nada que
 * scrollear. Las pestañas llevan `whitespace-nowrap` para que su ancho mínimo
 * sea el del label y la fila desborde (y scrollee) en lugar de aplastarlas.
 */
export const PILL_TAB_LIST_CLASS = [
  'max-w-full gap-2 overflow-x-auto overscroll-x-contain',
  '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
].join(' ')
