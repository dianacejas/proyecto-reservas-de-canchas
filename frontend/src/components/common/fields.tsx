import { ComboBox, Input, Label, ListBox, Select, TextField } from '@heroui/react'
import type { ReactNode } from 'react'

/**
 * Controles de formulario estandarizados sobre HeroUI v3.
 *
 * Reemplazan a los `<input>` / `<select>` nativos para que todos los formularios
 * y modales compartan label, foco lima, superficies y popovers temáticos
 * (claro/oscuro), sin depender del menú azul del sistema operativo.
 *
 * Nota de versión: este proyecto usa HeroUI v3, cuya API es compuesta
 * (`TextField` + `Input`, `Select` + `Select.Trigger` + `ListBox`). No existen
 * los props de v2 (`variant="bordered"`, `radius`, `classNames`, `SelectItem`).
 */

/** Oculta los spinners nativos que el navegador pinta en `<input type="number">`. */
export const HIDE_NUMBER_SPINNER =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

const LABEL_CLASS = 'text-sm font-medium text-coffee/80 dark:text-mauve-soft'
/** Mantiene el alto táctil (44px) que ya usaban los campos nativos de la app. */
const FIELD_CLASS = 'min-h-11'
/** El popover de HeroUI usa `bg-overlay` pero no fija color; se ancla al token. */
const POPOVER_CLASS = 'text-overlay-foreground'

type InputType = 'text' | 'number' | 'tel' | 'email' | 'password' | 'search' | 'url'

export interface TextInputProps {
  label?: ReactNode
  value: string
  onValueChange: (value: string) => void
  type?: InputType
  placeholder?: string
  min?: number
  max?: number
  autoFocus?: boolean
  className?: string
  inputClassName?: string
  'aria-label'?: string
  isDisabled?: boolean
}

/** Campo de texto o numérico con label integrado y sin spinners nativos. */
export function TextInput({
  label,
  value,
  onValueChange,
  type = 'text',
  placeholder,
  min,
  max,
  autoFocus,
  className,
  inputClassName,
  'aria-label': ariaLabel,
  isDisabled,
}: TextInputProps): React.JSX.Element {
  const isNumber = type === 'number'

  return (
    <TextField
      className={className}
      value={value}
      onChange={onValueChange}
      isDisabled={isDisabled}
      aria-label={label === undefined ? ariaLabel : undefined}
    >
      {label !== undefined && <Label className={LABEL_CLASS}>{label}</Label>}
      <Input
        type={type}
        placeholder={placeholder}
        min={min}
        max={max}
        autoFocus={autoFocus}
        fullWidth
        className={[FIELD_CLASS, isNumber ? HIDE_NUMBER_SPINNER : '', inputClassName]
          .filter(Boolean)
          .join(' ')}
      />
    </TextField>
  )
}

export interface SelectOption {
  key: string
  label: ReactNode
  /** Texto plano para accesibilidad; por defecto se deriva de `label` o `key`. */
  textValue?: string
}

export interface SelectInputProps {
  label?: ReactNode
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  'aria-label'?: string
  isDisabled?: boolean
  fullWidth?: boolean
}

/** Selector desplegable con popover y opciones temáticas (sin menú nativo). */
export function SelectInput({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  'aria-label': ariaLabel,
  isDisabled,
  fullWidth = true,
}: SelectInputProps): React.JSX.Element {
  return (
    <Select
      className={className}
      placeholder={placeholder}
      selectedKey={value === '' ? null : value}
      isDisabled={isDisabled}
      fullWidth={fullWidth}
      aria-label={label === undefined ? ariaLabel : undefined}
      onSelectionChange={(key) => onValueChange(key === null ? '' : String(key))}
    >
      {label !== undefined && <Label className={LABEL_CLASS}>{label}</Label>}
      <Select.Trigger className={FIELD_CLASS}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className={POPOVER_CLASS}>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              key={option.key}
              id={option.key}
              textValue={
                option.textValue ?? (typeof option.label === 'string' ? option.label : option.key)
              }
            >
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

export interface ComboBoxInputProps {
  label?: ReactNode
  value: string
  onValueChange: (value: string) => void
  options: string[]
  placeholder?: string
  className?: string
  'aria-label'?: string
  isDisabled?: boolean
  fullWidth?: boolean
}

/**
 * Campo de texto con sugerencias temáticas. Reemplaza al patrón
 * `<input list>` + `<datalist>` (menú nativo) permitiendo valores libres.
 */
export function ComboBoxInput({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  'aria-label': ariaLabel,
  isDisabled,
  fullWidth = true,
}: ComboBoxInputProps): React.JSX.Element {
  return (
    <ComboBox
      className={className}
      inputValue={value}
      onInputChange={onValueChange}
      allowsCustomValue
      isDisabled={isDisabled}
      fullWidth={fullWidth}
      aria-label={label === undefined ? ariaLabel : undefined}
    >
      {label !== undefined && <Label className={LABEL_CLASS}>{label}</Label>}
      <ComboBox.InputGroup className={FIELD_CLASS}>
        <Input placeholder={placeholder} fullWidth />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover className={POPOVER_CLASS}>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option} id={option} textValue={option}>
              {option}
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  )
}
