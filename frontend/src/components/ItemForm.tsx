import type { Customer, ItemFormData } from '../types';

type ItemFormProps = {
  formData: ItemFormData;
  customers: Customer[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function ItemForm({
  formData,
  customers,
  onChange,
  onCheckboxChange,
  onSubmit,
}: ItemFormProps) {
  return (
    <section className="card">
      <h3>Neues Kleidungsstück anlegen</h3>

      <form className="form-grid" onSubmit={onSubmit}>
        <select
          name="owner_customer_id"
          value={formData.owner_customer_id}
          onChange={onChange}
          required
        >
          <option value="">Eigentümer auswählen</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.customer_number} - {customer.first_name} {customer.last_name}
            </option>
          ))}
        </select>

        <input
          name="title"
          placeholder="Titel"
          value={formData.title}
          onChange={onChange}
          required
        />

        <textarea
          name="description"
          placeholder="Beschreibung"
          value={formData.description}
          onChange={onChange}
          rows={4}
        />

        <input
          name="category"
          placeholder="Kategorie"
          value={formData.category}
          onChange={onChange}
        />

        <input
          name="size"
          placeholder="Größe"
          value={formData.size}
          onChange={onChange}
        />

        <input
          name="brand"
          placeholder="Marke"
          value={formData.brand}
          onChange={onChange}
        />

        <input
          name="color"
          placeholder="Farbe"
          value={formData.color}
          onChange={onChange}
        />

        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Preis"
          value={formData.price}
          onChange={onChange}
          required
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={formData.is_online_visible}
            onChange={onCheckboxChange}
          />
          Im Onlineshop sichtbar
        </label>

        <button type="submit" className="primary-btn">
          Kleidungsstück speichern
        </button>
      </form>
    </section>
  );
}