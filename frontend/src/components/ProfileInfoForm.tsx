"use client";

import { useState } from "react";
import { Label }     from "@/components/ui/label";
import { Input }     from "@/components/ui/input";
import { Button }    from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast }  from "@/components/ui/use-toast";
import { apiFetch }  from "@/lib/api";

interface Props {
  initialUsername:string;
  initialEmail:   string;
}

export default function ProfileInfoForm({
  initialUsername,
  initialEmail,
}: Props) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading]   = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken") ?? "";
      await apiFetch("/auth/user/update/username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ user_name: username }),
      });
      toast("Username updated");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Account Info</h2>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Username */}
        <div>
          <Label className="text-sm text-muted-foreground">Username</Label>
          <Input
            value={username}
            onChange={e => setUsername(e.currentTarget.value)}
            disabled={!editing}
            className="mt-1 w-full text-base text-foreground"
          />
        </div>

        {/* Email (read‐only) */}
        <div>
          <Label className="text-sm text-muted-foreground">Email</Label>
          <p className="mt-1 w-full rounded border bg-muted/10 px-3 py-2 text-base text-foreground">
            {initialEmail}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {editing ? (
          <>
            <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit</Button>
        )}
      </CardFooter>
    </Card>
  );
}
