const normalize = (value) => String(value || '').trim().toLowerCase();

export const getDepartmentIdentity = (record) => {
    const department = record?.department;
    return {
        id: record?.departmentId || record?.department_id || record?.department?.id || record?.department?._id || record?.department?.department_id,
        name: record?.departmentName || record?.department_name || record?.department?.name || (typeof department === 'string' ? department : ''),
    };
};

export const getDepartmentScope = (user, departments = []) => {
    const scope = getDepartmentIdentity(user);
    const id = scope.id || user?.department?._id;
    const name = scope.name || (typeof user?.department === 'string' ? user.department : '');
    const matchingDepartment = departments.find((department) => {
        const departmentId = department?.id || department?._id || department?.departmentId || department?.department_id;
        const departmentName = department?.name || department?.departmentName || department?.department_name;
        return (id && String(departmentId || '') === String(id)) || (name && normalize(departmentName) === normalize(name));
    });
    const resolved = {
        id: matchingDepartment?.id || matchingDepartment?._id || matchingDepartment?.departmentId || matchingDepartment?.department_id,
        name: matchingDepartment?.name || matchingDepartment?.departmentName || matchingDepartment?.department_name,
    };
    return { id: id || resolved.id || '', name: name || resolved.name || '' };
};

export const isDepartmentRecordInScope = (department, scope) => {
    const id = department?.id || department?._id || department?.departmentId || department?.department_id;
    const name = department?.name || department?.departmentName || department?.department_name;
    return Boolean((scope?.id && id && String(scope.id) === String(id)) || (scope?.name && name && normalize(scope.name) === normalize(name)));
};

export const belongsToDepartment = (record, scope) => {
    if (!scope?.id && !scope?.name) return false;
    const identity = getDepartmentIdentity(record);
    if (scope.id && identity.id && String(scope.id) === String(identity.id)) return true;
    if (scope.name && identity.name && normalize(scope.name) === normalize(identity.name)) return true;
    return false;
};
