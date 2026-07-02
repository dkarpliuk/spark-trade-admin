import logo from '@/assets/logo.png'

function Logo() {
  return (
    <span className="flex h-full items-center">
      <img src={logo} alt="Spark.trade Admin" className="h-full w-auto select-none" />
    </span>
  )
}

export default Logo
