import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {User} from "lucide-react";
import Link from "next/link";

function UserButton() {
    return (
        
            <Button variant={"outline"} size={"icon"}>
                <Link 
                    href="/sign_in_sign_up"
                    className="
                            flex        
                            items-center       
                            justify-center     
                            h-full             
                            aspect-square      
                            p-0                
                            rounded-none      
                    "
                >
                    <User/>
                </Link>
            </Button>
        
    );
}

export default UserButton;