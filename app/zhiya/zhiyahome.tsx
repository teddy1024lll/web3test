"use client"

import { Button } from "@/components/ui/button"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { ZhiyaPage } from "./zhiyapage";
import { QukuanPage } from "./qukuanpage";

export function ZhiyaHome() {
    const [selectIndex, setIndex] = useState(0);

    return (<div className=" items-center">
        <div className="w-full h-15 bg-amber-200 flex flex-row items-center justify-center gap-14">
            <Button onClick={() => { setIndex(0) }} className={`bg-green-500 w-30 ${selectIndex == 0 ? "ring-4" : "ring-0"} ring-red-950`}>质押</Button>
            <Button onClick={() => { setIndex(1) }} className={`bg-green-500 w-30 ${selectIndex == 1 ? "ring-4" : "ring-0"} ring-red-950`}  >取款</Button>
            <div className="w-50"></div>
            <div className="ml-4">
                <ConnectButton />
            </div>
        </div>
        <div className="flex flex-col justify-center items-center mt-3">
            {selectIndex === 0 ? <ZhiyaPage /> : <QukuanPage />}</div>

    </div >)

}