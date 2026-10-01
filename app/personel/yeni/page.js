import PersonelForm from '@/components/personel/PersonelForm';

export default function YeniPersonelPage() {
    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Yeni Personel</h1>
            <PersonelForm />
        </div>
    );
}