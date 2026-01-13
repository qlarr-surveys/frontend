import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./Page404.module.css";

function Page404() {
  const { t } = useTranslation("manage");
  return (
    <div className={styles.pageWarper}>
      <div className={styles.pageTitle}>404</div>
      <div className={styles.pageSubTitle}>{t("error.page_not_found")}</div>
    </div>
  );
}

export default Page404;
