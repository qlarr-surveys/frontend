import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormProvider from "~/components/hook-form";

export default function ResponsesDownload({
  open,
  onClose,
  onDownload,
  maxCount = 1,
  t,
}) {
  const min = 1;
  const max = Math.max(1, Number(maxCount) || 1);

  const VerifySchema = yup.object().shape({
    from: yup
      .number()
      .typeError(t("responses.enter_a_number"))
      .required(t("responses.enter_a_number"))
      .min(min, t("responses.min", { min }))
      .max(max, t("responses.max", { max })),
    to: yup
      .number()
      .typeError(t("responses.enter_a_number"))
      .required(t("responses.enter_a_number"))
      .min(min, t("responses.min", { min }))
      .max(max, t("responses.max", { max }))
      .test("gte-from", t("responses.range_invalid"), function (value) {
        const { from } = this.parent;
        if (typeof from !== "number" || typeof value !== "number") return false;
        return value >= from;
      }),
    filter: yup.string().oneOf(["all", "complete", "incomplete"]).required(),
  });
  const methods = useForm({
    mode: "onChange",
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      from: 1,
      to: 1,
      filter: "all",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = handleSubmit((data) => {
    // onDownload?.({
    //   from: Number(data.from),
    //   to: Number(data.to),
    //   filter: data.filter,
    // });
    onClose?.();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("responses.download")}</DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ display: "grid", gap: 2 }}>
          <Box display="flex" gap={2}>
            <Controller
              name="from"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("responses.from")}
                  type="number"
                  inputProps={{ min, max }}
                  error={!!errors.from}
                  helperText={errors.from?.message || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? "" : Number(v));
                  }}
                />
              )}
            />

            <Controller
              name="to"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("responses.to")}
                  type="number"
                  inputProps={{ min, max }}
                  error={!!errors.to}
                  helperText={errors.to?.message || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? "" : Number(v));
                  }}
                />
              )}
            />
          </Box>

          <FormControl>
            <FormLabel>{t("responses.responses_type")}</FormLabel>
            <Controller
              name="filter"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel
                    value="all"
                    control={<Radio />}
                    label={t("responses.filter_completed_show_all")}
                  />
                  <FormControlLabel
                    value="complete"
                    control={<Radio />}
                    label={t("responses.complete_responses")}
                  />
                  <FormControlLabel
                    value="incomplete"
                    control={<Radio />}
                    label={t("responses.incomplete_responses")}
                  />
                </RadioGroup>
              )}
            />
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{t("action_btn.cancel")}</Button>
          <Button type="submit" variant="contained">
            {t("action_btn.download")}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
