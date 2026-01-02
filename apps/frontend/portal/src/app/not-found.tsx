import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <h2 className="text-4xl font-bold text-gray-900">404</h2>
            <p className="text-xl text-gray-600">Page Not Found</p>
            <Link href="/">
                <Button>Return Home</Button>
            </Link>
        </div>
    );
}
