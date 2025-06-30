const rsxConfig = {
  ssr: false,
}

export function enableSSR() {
  rsxConfig.ssr = true
}

export function disableSSR() {
  rsxConfig.ssr = false
}
