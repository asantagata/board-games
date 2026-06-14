import context from "@/context.js";

export default function NumberInput(getter, setter, {placeholder, label, spinners = true, inputProps} = {placeholder: '', label: undefined, spinners: true, inputProps: {}}) {
    const input = {
        tag: 'input', type: 'number', placeholder, value: `${getter()}`, ...inputProps, on: {change() {
            let value = +this.target.value;
            if (Object.hasOwn(inputProps, 'min') && value < inputProps.min) value = inputProps.min;
            if (Object.hasOwn(inputProps, 'max') && value > inputProps.max) value = inputProps.max;
            if (Object.hasOwn(inputProps, 'step')) 
                value = Math.sign(value) * (Math.abs(value) - (Math.abs(value) % inputProps.step));
            setter(value);
            this.target.valueAsNumber = getter();
            context.rerender();
        }, mount() { this.state.ref = this.target; }}
    };
    const spinneredInput = spinners && !inputProps.disabled ? {
        tag: 'label', class: 'number-input-wrapper', children: [
            input,
            ...(spinners && !inputProps.disabled ? [{tag: 'span', class: 'number-input-spinners', children: [
                {tag: 'span', class: {
                    'number-input-spinner': true,
                    'disabled': Object.hasOwn(inputProps, 'max') && (getter() + (inputProps.step ?? 1) > inputProps.max)
                }, children: '+', on: {click(e) {
                    e.preventDefault();
                    const newValue = getter() + (inputProps.step ?? 1);
                    if (!Object.hasOwn(inputProps, 'max') || newValue <= inputProps.max) {
                        setter(newValue);
                        context.rerender();
                    }
                }}},
                {tag: 'span', class: {
                    'number-input-spinner': true,
                    'disabled': Object.hasOwn(inputProps, 'min') && (getter() - (inputProps.step ?? 1) < inputProps.min)
                }, children: '-', on: {click(e) {
                    e.preventDefault();
                    const newValue = getter() - (inputProps.step ?? 1);
                    if (!Object.hasOwn(inputProps, 'min') || newValue >= inputProps.min) {
                        setter(newValue);
                        context.rerender();
                    }
                }}},
            ]}] : [])
        ]
    } : input;
    const labelledInput = label !== undefined ? {
        class: 'label-input col',
        children: [
            {tag: 'label', children: label},
            spinneredInput
        ]
    } : spinneredInput;
    return {
        state() {
            return { ref: null }
        }, render() {
            if (this.state.ref) this.state.ref.valueAsNumber = getter();
            return labelledInput;
        }
    };
}