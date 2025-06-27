const airConfig = {
  ssr: false,
}

export function enableSSR() {
  airConfig.ssr = true
}

export function disableSSR() {
  airConfig.ssr = false
}
