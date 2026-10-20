import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Vuelve al inicio del documento al cambiar de ruta.
 *
 * Sin esto, entrar a una página desde un enlace del footer (que está al final
 * del documento) dejaba el scroll al final y la vista aparecía a mitad de
 * página. No reacciona al hash: /#reservas lo resuelve el Navbar, que necesita
 * esperar a que la grilla esté montada.
 */
export default function ScrollToTop(): null {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
