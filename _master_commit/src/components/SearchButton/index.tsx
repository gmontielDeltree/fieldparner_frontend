import React from "react";
import { Button } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

export interface SearchButtonProps {
  text: string | React.ReactNode;
  onClick: () => void;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  text,
  onClick,
}) => {
  return (
    <Button
      variant="contained"
      color="primary"
      size="medium"
      fullWidth
      sx={{
        height: "98%",
        margin: "auto",
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
      onClick={() => onClick()}
      startIcon={<SearchIcon />}
    >
      {text}
    </Button>
  );
};
