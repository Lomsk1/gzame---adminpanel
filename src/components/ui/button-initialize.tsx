import { ButtonComponent } from '../form/button';

type Props = {
    onClick: () => void
}

export default function ButtonInitialization({ onClick }: Props) {
    return (
        <ButtonComponent
            variant="oracle"
            onClick={onClick}
            className="w-full md:w-auto px-2 py-3 shadow-[0_0_20px_rgba(var(--admin-primary-rgb),0.2)]"
            size="sm"
        >
            + INITIALIZE_NEW_NODE
        </ButtonComponent>
    )
}