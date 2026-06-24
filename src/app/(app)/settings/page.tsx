"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">조직 설정</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          조직 관리, 멤버 초대 등 설정 기능은 v1에서 제공됩니다.
        </CardContent>
      </Card>
    </div>
  );
}
