"use client"

import React, { useState } from 'react';
import CheckBalance from "./chenkBalance"
import SendETH from "./sendETH";
import TokenBalance from "./tokenBalance";
import SendTDC from "./sendTDC";
import { Button } from '@/components/ui/button';
import HomePage from './homepage';
import { ZhiyaHome } from './zhiya/zhiyahome';

export default function Home() {
  return <HomePage />;
}
