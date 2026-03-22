import React from "react";
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

const LoadingItem = ({ message = "Đang tải dữ liệu...", value }) => (
  <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem] mx-auto my-8">
    <Item variant="muted">
      <ItemMedia>
        <Spinner />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-1">{message}</ItemTitle>
      </ItemContent>
      {value !== undefined && (
        <ItemContent className="flex-none justify-end">
          <span className="text-sm tabular-nums">{value}</span>
        </ItemContent>
      )}
    </Item>
  </div>
);

export default LoadingItem;
