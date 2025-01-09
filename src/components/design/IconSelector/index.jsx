import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import IconService from "~/services/IconService";
import styles from "./IconSelector.module.css";

function IconSelector({ currentIcon, onIconSelected }) {
  const { t } = useTranslation("design");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelToken, setCancelToken] = useState(null);
  const [searchResults, setSearchResults] = useState([]);


  const defaultIcons = [
    "mdi:alphabet-a",
    "mdi:alphabet-b",
    "mdi:alphabet-c",
    "mdi:numeric-1-circle",
    "mdi:numeric-2-circle",
    "mdi:numeric-3-circle",
    "mdi:thumb-up",
    "mdi:thumb-down",
    "mdi:star",
    "mdi:heart",
    "mdi:check-circle",
    "mdi:alert-circle",
  ];

  useEffect(() => {
    if (cancelToken) {
      cancelToken.cancel("Operation canceled by the user.");
    }
    if (searchTerm) {
      // Define your API endpoint for icon search
      const source = axios.CancelToken.source();
      setCancelToken(source);
      IconService.search(searchTerm, source)
        .then((result) => {
          setSearchResults(result);
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      setSearchResults([]); // Clear the results if the search term is empty
    }
  }, [searchTerm]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };


  const iconsToDisplay = searchTerm ? searchResults : defaultIcons;


  return (
    <Dialog
      fullScreen={true}
      sx={{ margin: "200px" }}
      open={true}
      onClose={() => onIconSelected(false)}
      aria-labelledby="alert-dialog-title-logic-builder"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title-logic-builder">
        {t("Select Icon")}
      </DialogTitle>
      <DialogContent>
        <div>
          <input
            type="text"
            placeholder="Search for icons"
            value={searchTerm}
            onChange={handleInputChange}
          />

          <div className="search-results">
            {iconsToDisplay.map((icon, index) => {
              const parts = icon.split(":");
              return (
                <SVGDisplay
                  onClick={onIconSelected}
                  key={index}
                  source={`https://api.iconify.design/${parts[0]}/${parts[1]}.svg`}
                />
              );
            })}
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {}} autoFocus>
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IconSelector;

function SVGDisplay({ source, onClick }) {
  const [svgSource, setSvgSource] = useState("");
  useEffect(() => {
    // Fetch the SVG source after the component mounts
    axios.get(source).then((response) => {
      if (isSVGValid(response.data)) {
        setSvgSource(response.data);
      }
    });
  }, [source]);
  return (
    <div
      onClick={() => {
        onClick(svgSource);
      }}
      className={styles.resultImage}
      dangerouslySetInnerHTML={{ __html: svgSource }}
    />
  );
}

function isSVGValid(svgContent) {
  if (typeof svgContent !== "string") {
    return false;
  }

  // Check if the string starts with "<svg" and ends with "</svg>"
  return /^<svg[\s\S]*<\/svg>$/.test(svgContent);
}
