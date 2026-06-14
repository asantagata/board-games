import context from "@/context.js";

export default function Checkbox(getter, setter, inputProps) {
    const input = {
        tag: 'input', type: 'checkbox', checked: getter() || undefined, ...inputProps, on: {change() {
            setter(this.target.checked);
            context.rerender();
        }, mount() { this.state.ref = this.target; }}
    };
    return {
        state() {
            return { ref: null }
        }, render() {
            if (this.state.ref) this.state.ref.checked = getter();
            return input;
        }
    };
}