import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MenuModules, MenuModulesPermission, ModulesUsers } from '../interfaces/menuModules';
import { dbContext } from "../services/pouchdbService";
import { useAppSelector } from './useRedux';
import { NotificationService } from "../services/notificationService";

export const useModulesPermission = () => {
    const { t } = useTranslation();
    const { user } = useAppSelector(state => state.auth);
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [menuModules, setMenuModule] = useState<MenuModules[]>([]);
    const [modulesFromUser, setModulesFromUser] = useState<ModulesUsers[]>([]);
    const [modulesPermissions, setModulesPermissions] = useState<MenuModulesPermission[]>([]);

    // crear lista de los nuevo modulos a agregar y otra lista con los modulos a actualizar
    const putModulesUserByUserId = async (userId: string, modules: MenuModulesPermission[]) => {
        setIsLoading(true);
        try {
            if (!user) throw new Error(t("userNotFound"));

            const responseLicenceUse = await dbContext.licencesUse.find({
                selector: { "accountId": user.accountId }
            });
            const licenceUse = responseLicenceUse.docs[0];
            let putModules: ModulesUsers[] = [];

            modules.forEach(m => {
                if (modulesFromUser.find(v => v.menuId === m.id)) {
                    modulesFromUser.forEach(x => {
                        if (m.id === x.menuId)
                            putModules.push({ ...x, permission: m.permission });
                    });
                } else {
                    let newModuleUser: ModulesUsers = {
                        accountId: user.accountId,
                        licenceId: licenceUse.licenceId,
                        menuId: m.id,
                        permission: m.permission,
                        userId,
                        creationDate: new Date().toLocaleDateString()
                    };
                    putModules.push(newModuleUser);
                }
            });
            const putResponse = await dbContext.modulesUsers.bulkDocs(putModules);

            setIsLoading(false);
            if (putResponse)
                NotificationService.showSuccess(t("modulePermissionsAddedUpdated"), null, t("modulePermissionsLabel"));
            else
                NotificationService.showError(t("errorAddingUpdatingPermissions"), null, t("modulePermissionsLabel"));

        } catch (error) {
            console.log(error)
            NotificationService.showError(t("unexpectedError"), null, null);
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    const getModulesByUserId = async (userId: string) => {
        setIsLoading(true);
        try {
            const response = await Promise.all([
                dbContext.menuModules.allDocs({ include_docs: true }),
                dbContext.modulesUsers.find({
                    selector: { "userId": userId }
                }),
            ]);
            const modules = response[0].rows.map(row => row.doc as MenuModules);
            const modulesOrdAsc = modules.sort((a, b) => {
                const orderA = a.order !== undefined ? Number(a.order) : Infinity;
                const orderB = b.order !== undefined ? Number(b.order) : Infinity;
                return orderA - orderB;
            });
            const modulesUsers = response[1].docs.map(doc => doc as ModulesUsers);
            const menuesIdByUser = response[1].docs.filter(doc => doc.permission).map(x => x.menuId);

            let modulosUsuario: MenuModulesPermission[] = [];

            modulesOrdAsc.forEach(module => {
                modulosUsuario.push({
                    ...module,
                    permission: menuesIdByUser.includes(module.id)
                })
            });
            setModulesFromUser(modulesUsers);
            setModulesPermissions(modulosUsuario);
            setIsLoading(false);

        } catch (error) {
            console.log(error)
            NotificationService.showError(t("errorGettingMenuModules"), null, t("errorLabel"));
            setIsLoading(false);
            if (error) setError(error);
        }
    }

    return {
        //* Propiedades
        error,
        isLoading,
        menuModules,
        modulesPermissions,

        //* Métodos
        putModulesUserByUserId,
        setMenuModule,
        getModulesByUserId,
        setModulesPermissions
    };
};