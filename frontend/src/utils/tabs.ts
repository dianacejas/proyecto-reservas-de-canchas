export const PILL_TAB_CLASS = [
  'rounded-xl px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm',
  'text-stone-600 hover:text-white hover:bg-stone-200/50',
  'text-neutral-400 hover:text-white hover:bg-white/10',
  'data-[selected=true]:bg-stone-900 data-[selected=true]:text-white data-[selected=true]:font-bold data-[selected=true]:shadow-sm',
  'data-[selected=true]:bg-[#c5d86d] data-[selected=true]:text-neutral-950 data-[selected=true]:font-black',
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
  'max-w-full gap-2 overflow-x-auto overscroll-x-contain p-1 rounded-2xl bg-neutral-900/60 border border-white/5',
  '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
].join(' ')
