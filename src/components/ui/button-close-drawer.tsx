type Props = {
  onClose: () => void;
};

const ButtonCloseDrawer = (props: Props) => {
  return (
    <button
      type="button"
      onClick={props.onClose}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-admin-border text-admin-text-dim hover:text-admin-text hover:bg-admin-card transition-colors cursor-pointer"
      aria-label="Close"
    >
      ✕
    </button>
  );
};

export default ButtonCloseDrawer;
