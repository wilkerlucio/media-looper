export function Button({ children }) {
    return (
        <button className="p-2 rounded bg-blue-500 hover:bg-blue-600 transition">
            {children}
        </button>
    );
}
