type Props = {
  onClose: () => void
}

const ButtonCloseDrawer = (props: Props) => {
  return (
    <button onClick={props.onClose} className="text-admin-text-dim hover:text-white transition-colors cursor-pointer text-xl">✕</button>
  )
}

export default ButtonCloseDrawer