import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')

/** Link do roteador para rotas internas; <a> comum (nova aba) para fora do site. */
export const SmartLink = forwardRef<HTMLAnchorElement, Props>(function SmartLink(
  { href, children, ...rest },
  ref,
) {
  if (isInternal(href)) {
    return (
      <Link ref={ref} to={href} {...rest}>
        {children}
      </Link>
    )
  }
  const external = /^https?:/.test(href)
  return (
    <a ref={ref} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  )
})
