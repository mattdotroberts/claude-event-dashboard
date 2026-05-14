import './InterestStream.css';

interface Item {
  _id: string;
  name: string;
  role: string;
  interest: string;
  interestBucket?: string;
}

interface Props {
  items: Item[];
}

export function InterestStream({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="is is--empty">
        <p>No topics yet. Scan to join.</p>
      </div>
    );
  }

  return (
    <div className="is">
      {items.map((item, i) => (
        <div className="is__card" key={item._id} style={{ animationDelay: `${i * 0.05}s` }}>
          <div className="is__head">
            <span className="is__name">{item.name}</span>
            <span className="is__role">{item.role}</span>
          </div>
          <p className="is__interest">“{item.interest}”</p>
          {item.interestBucket && (
            <span className="is__bucket">{item.interestBucket}</span>
          )}
        </div>
      ))}
    </div>
  );
}
