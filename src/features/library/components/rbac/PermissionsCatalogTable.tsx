import type { PermissionResource } from '../../types/library.types';

interface PermissionsCatalogTableProps {
  resources: PermissionResource[];
}

function formatAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export default function PermissionsCatalogTable({ resources }: PermissionsCatalogTableProps) {
  if (resources.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">No permissions found</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Resource</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Permission</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Key</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {resources.flatMap((resource) =>
            resource.permissions.map((permission, index) => (
              <tr
                key={permission.permission_id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                {index === 0 && (
                  <td
                    className="py-3 px-4 align-top"
                    rowSpan={resource.permissions.length}
                  >
                    <div className="font-medium text-slate-900">{resource.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{resource.resource}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {resource.available_actions.map((action) => (
                        <span
                          key={action}
                          className="inline-block px-1.5 py-0.5 text-xs rounded bg-slate-100 text-slate-600"
                        >
                          {formatAction(action)}
                        </span>
                      ))}
                    </div>
                  </td>
                )}
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-900">{permission.name}</span>
                </td>
                <td className="py-3 px-4">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {permission.key}
                  </code>
                </td>
                <td className="py-3 px-4 text-slate-600 text-sm max-w-xs">
                  {permission.description}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      permission.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {permission.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {permission.is_system && (
                    <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      System
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
