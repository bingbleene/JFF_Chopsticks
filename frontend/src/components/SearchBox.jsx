import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search } from "lucide-react"

export default function SearchBox({
  value = '',
  onChange = () => {},
  placeholder = 'Tìm kiếm...',
  resultText = '',
  ...props
}) {
  return (
    <InputGroup className="max-w-xs" {...props}>
      <InputGroupInput
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {resultText && (
        <InputGroupAddon align="inline-end">{resultText}</InputGroupAddon>
      )}
    </InputGroup>
  )
}
