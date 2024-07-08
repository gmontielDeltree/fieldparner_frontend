import { useNavigate } from "react-router-dom";
import { ColumnProps, UserByAccount } from "../types";
import React, { useEffect } from "react";
import { useForm, useUser } from "../hooks";
import {
  DataTable,
  ItemRow,
  Loading,
  SearchButton,
  SearchInput,
  TableCellStyled,
  TemplateLayout,
  CloseButtonPage,
} from "../components";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import 'semantic-ui-css/semantic.min.css';
// import { Icon } from "semantic-ui-react";
import {
  PersonAdd as PersonAddAltIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  NotInterested as NotInterestedIcon
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
// import { User } from "@auth0/auth0-spa-js";
// import { User } from "@auth0/auth0-spa-js";
// import Swal from 'sweetalert2';





export const ListUsersPage: React.FC = () => {
  const navigate = useNavigate();
  // const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isLoading, users, getUsers } = useUser();
  const { filterText, handleInputChange } = useForm({ filterText: "" });

  const columns: ColumnProps[] = [
    { text: "Usuario", align: "left" },
    { text: "Email", align: "center" },
    { text: "Estado", align: "center" },
    { text: "Admin", align: "center" },
    { text: "", align: "center" },
  ];

  // const { user } = useAppSelector((state) => state.auth);

  const onClickUpdateUser = (item: UserByAccount): void => {
    // dispatch(setUserActive(item));
    navigate(`/init/overview/users/${item._id}`);
    getUsers();
  };
  // const handleDeleteUser = (item: UserByAccount) => {
  //   if (item._id && item._rev) {
  //     removeUsers(item._id, item._rev);
  //     getUsers();
  //   }
  // };

  useEffect(() => {
    getUsers();
  }, []);

  function onClickSearch(): void {

  }

  return (
    <TemplateLayout key="overview-users" viewMap={false}>
      {isLoading && <Loading loading />}
      <Container maxWidth="md" sx={{ ml: 0 }}>
        <Box
          component="div"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ ml: { sm: 2 }, pt: 2, pr: 2 }}
        >
          <Box display="flex" alignItems="center">
            < PersonAddAltIcon sx={{ marginRight: '8px' }} />
            <Typography component="h2" variant="h4" sx={{ ml: { sm: 2 } }}>
              Usuarios
            </Typography>
          </Box>
          <CloseButtonPage />
        </Box>
        <Box component="div" sx={{ mt: 7 }}>
          <Grid
            container
            spacing={0}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2, mt: { sm: 2 } }}
          >
            <Grid item xs={6} sm={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => navigate("/init/overview/users/new")}
              >
                {t("new_masculine")}
              </Button>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Grid container justifyContent="flex-end">
                <Grid item xs={8} sm={7}>
                  <SearchInput
                    value={filterText}
                    placeholder={"Usuario / Email"}
                    handleInputChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={4} sm={3}>
                  <SearchButton text={t("icon_search")} onClick={() => onClickSearch()} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box component="div" sx={{ p: 1 }}>
            <DataTable
              key="datatable-users"
              columns={columns}
              isLoading={isLoading}
            >
              {users.map((row) => (
                <ItemRow key={row._id} hover>
                  <TableCellStyled align="left">{row.username}</TableCellStyled>
                  <TableCellStyled align="center">{row.email}</TableCellStyled>
                  <TableCellStyled align="center">
                    {row.state}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    {row.isAdmin
                      ?
                      <CheckCircleOutlineIcon color="success" fontSize="large" />
                      :
                      <NotInterestedIcon color="warning" fontSize="large" />}
                  </TableCellStyled>
                  <TableCellStyled align="center">
                    <Tooltip title={t("icon_edit")}>
                      <IconButton
                        aria-label={t("icon_edit")}
                        onClick={() => onClickUpdateUser(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {/* <Tooltip title={t("icon_delete")}>
                      <IconButton
                        onClick={() => handleDeleteUser(row)}
                        style={{ fontSize: '1rem' }}
                      >
                        <Icon name="trash alternate" />
                      </IconButton>
                    </Tooltip> */}
                  </TableCellStyled>
                </ItemRow>
              ))}
            </DataTable>
          </Box>
        </Box>
      </Container>
    </TemplateLayout>
  );
};
