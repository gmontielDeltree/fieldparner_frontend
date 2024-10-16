import { touchEvent } from "../../../owncomponents/helpers";
// import { writeFile, utils } from "xlsx";
let read, writeFile, utils;
import("xlsx").then((mod) => {
  read = mod.read;
  writeFile = mod.writeFile;
  utils = mod.utils;
});

export const add_download_xls_button = (root, ts, data, title) => {
  let a = root.querySelector(".apexcharts-menu");
  let new_menu_item = document.createElement("div");
  new_menu_item.className = "apexcharts-menu-item";
  new_menu_item.title = "Download XLS";
  new_menu_item.textContent = "Download XLS";
  a.appendChild(new_menu_item);

  new_menu_item.addEventListener(touchEvent, () => {
    let datas = data; //this_opts.series[0].data
    let tss = ts; //this_opts.xaxis.categories

    let header_row = ["Timestamp", title];
    let all_rows = [];
    all_rows.push(header_row);
    for (let index = 0; index < datas.length; index++) {
      const element = [tss[index], datas[index]];
      all_rows.push(element);
    }

    const worksheet = utils.aoa_to_sheet(all_rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, title);
    writeFile(workbook, title + ".xlsx");
  });
};
