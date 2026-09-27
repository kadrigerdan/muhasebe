import TedarikciForm from '@/components/tedarikci/TedarikciForm';

export default function YeniTedarikciPage() {
    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Yeni Tedarikçi</h1>
            <TedarikciForm />
        </div>
    );
}