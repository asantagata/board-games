import context from "@/context.js";

export default function TextInput(getter, setter, {placeholder, label, onInput, inputProps} = {placeholder: '', label: null, onInput: () => {}, inputProps: {}}) {
    const input = {
        tag: 'input', type: 'text', placeholder, value: getter(), ...inputProps, on: {change() {
            setter(this.target.value);
            this.target.value = getter();
            context.rerender();
        }, input() { onInput?.call(this); }, mount() { this.state.ref = this.target; }}
    };
    const labelledInput = label !== null ? {
        class: 'label-input col',
        children: [
            {tag: 'label', children: label},
            input
        ]
    } : input;
    return {
        state() {
            return { ref: null }
        }, render() {
            if (this.state.ref) this.state.ref.value = getter();
            return labelledInput;
        }
    };
}