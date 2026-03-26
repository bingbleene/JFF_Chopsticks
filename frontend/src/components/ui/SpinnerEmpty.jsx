import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function SpinnerEmpty() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4">
      <Spinner className="w-10 h-10" />
      <div className="text-lg font-semibold">Đang tải trang...</div>
      <div className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát. Không tải lại trang.</div>
      {/* <Button variant="outline" size="sm">Huỷ</Button> */}
    </div>
  );
}

export default SpinnerEmpty;
