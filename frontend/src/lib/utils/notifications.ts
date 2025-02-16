import { notifications } from "@mantine/notifications";

function showError(text: string) {
  notifications.show({
    title: "An Error has occurred",
    message: text,
    color: "red",
  });
}

function showInfo(text: string) {
  notifications.show({
    title: "Success",
    message: text,
    color: "green",
  });
}

export { showError, showInfo };
