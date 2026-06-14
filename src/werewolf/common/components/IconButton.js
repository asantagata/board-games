export default function IconButton(props) {
    const {class: className, ...usableProps} = props;
    return {
        tag: 'button', class: `icon-button subtle-button ${className}`, ...usableProps
    }
}