export default function CardItem({ card, onEdit }) {
    return (
        <div className="rounded-xl bg-white p-3 shadow">
            <button onClick={()=>onEdit(card)} className="w-full text-left">{card.title || "Sin título"}</button>
        </div>
    );
}
