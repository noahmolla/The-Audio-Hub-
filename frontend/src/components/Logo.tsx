import Link from 'next/link';
import { HandCoins } from 'lucide-react';

function Logo(){
    return (
        <Link href="/" className="flex items-center gap-2">
            <HandCoins className={'stroke h-11 w-11 stroke-amber-500 stroke[1.5]'}/>
            <p className={'bg-gradient-to-r bg-clip-text text-3xl from-amber-300 to-orange-500 text-transparent'}>
                The Audio Hub
            </p>
        </Link>
    );
}

export default Logo;