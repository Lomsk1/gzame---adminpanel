import { useRouteError } from "react-router";
import { ErrorBoundary } from "./boundary";

export function GlobalRouteError() {
    const error = useRouteError();

    // We use a key based on the error message to force the boundary 
    // to reset if a different error occurs
    return (
        <ErrorBoundary key={error?.toString()}>
            <ErrorTrigger error={error} />
        </ErrorBoundary>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ErrorTrigger({ error }: { error: any }) {
    if (error) throw error; // This triggers getDerivedStateFromError in the Boundary
    return null;
}