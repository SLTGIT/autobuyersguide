'use client';

import dynamic from "next/dynamic";
import React from "react";

const AOSInit = dynamic(() => import('@/components/AOSInit'), { ssr: false });
const NextTopLoader = dynamic(() => import('nextjs-toploader'), { ssr: false });

export function ClientImports() {
    return (
        <>
            <NextTopLoader
                color="#2563eb"
                height={3}
                showSpinner={false}
                shadow="0 0 10px #2563eb,0 0 5px #2563eb"
            />
            <AOSInit />
        </>
    );
}
