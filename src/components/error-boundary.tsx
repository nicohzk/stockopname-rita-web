import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ErrorBoundaryProps = {
  children: ReactNode;
  /**
   * Nilai yang berubah saat pengguna pindah halaman (mis. pathname). Tanpa ini
   * error yang sudah tertangkap akan menetap sampai halaman di-reload penuh.
   */
  resetKey?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * Menahan satu halaman yang gagal dirender agar shell aplikasi tetap hidup:
 * sidebar dan navigasi masih bisa dipakai untuk pindah ke halaman lain.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Halaman gagal dirender:", error, info.componentStack);
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Card className="my-5">
        <CardHeader>
          <CardTitle>Halaman gagal ditampilkan</CardTitle>
          <CardDescription>
            Terjadi kesalahan saat merender halaman ini. Data yang sudah tersimpan tidak terpengaruh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm break-words">{error.message}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => window.location.reload()}>Muat ulang</Button>
            <Link to="/stock-opname" className="text-sm underline underline-offset-4">
              Kembali ke daftar sesi
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
}
