import { Alert, Button } from '@heroui/react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Algo salió mal',
  message,
  onRetry,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div className="space-y-3 py-6">
      <Alert status="danger">
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert>
      {onRetry !== undefined && (
        <Button variant="secondary" size="sm" onPress={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}