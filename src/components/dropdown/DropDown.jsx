import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select"
import {typeVietSub} from "../../util/typeVietsub";

export default function DropDown({
                                       placeholder,
                                       value,
                                       field,
                                       options,
                                       onChange,
                                   }) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                className="w-[200px] bg-white/20 text-white border-white/20 hover:bg-white/30 hover:scale-105 transition-all duration-200 cursor-pointer text-lg"
            >
                <SelectValue placeholder={placeholder}/>
            </SelectTrigger>
            <SelectContent className="bg-purple-900 text-white border-white/20">
                {options.map((item) => (
                    <SelectItem
                        key={item.id}
                        value={item.name}
                        className="hover:bg-white/20 cursor-pointer transition-colors duration-200 text-lg"
                    >
                        {field === "type" ? typeVietSub(item.name) : item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

