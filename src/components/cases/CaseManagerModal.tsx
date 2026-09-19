import { useEffect, useState } from "react";
import { StatusBadge } from "../common/StatusBadge";
import type { InvestigationCase } from "../../types";

interface CaseManagerModalProps {
  cases: InvestigationCase[];
  activeCaseId: string | null;
  onOpen: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export function CaseManagerModal({
  cases,
  activeCaseId,
  onOpen,
  onRename,
  onDelete,
  onCreateNew,
}: CaseManagerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredCases = cases.filter((c) => {
    const needle = debouncedTerm.trim().toLowerCase();
    if (!needle) return true;
    return c.name.toLowerCase().includes(needle) || c.id.toLowerCase().includes(needle);
  });

  function startRename(c: InvestigationCase) {
    setRenamingId(c.id);
    setRenameValue(c.name);
    setConfirmingDeleteId(null);
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue("");
  }

  function saveRename(id: string) {
    if (renameValue.trim().length < 3) return;
    onRename(id, renameValue.trim());
    setRenamingId(null);
    setRenameValue("");
  }

  function startDeleteConfirm(id: string) {
    setConfirmingDeleteId(id);
    setRenamingId(null);
  }

  function cancelDeleteConfirm() {
    setConfirmingDeleteId(null);
  }

  function confirmDelete(id: string) {
    onDelete(id);
    setConfirmingDeleteId(null);
  }

  const renameInvalid = renamingId !== null && renameValue.trim().length < 3;

  return (
    <div className="case-manager">
      <div className="case-manager-toolbar">
        <button type="button" className="btn-primary" onClick={onCreateNew}>
          New Case
        </button>
        <div className="field-group case-search-group">
          <label htmlFor="case-search">Search cases</label>
          <input
            id="case-search"
            type="text"
            placeholder="Filter by name or case ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {cases.length === 0 ? (
        <p className="case-manager-empty">No investigations yet.</p>
      ) : (
        <table className="case-table">
          <thead>
            <tr>
              <th scope="col">Case ID</th>
              <th scope="col">Name</th>
              <th scope="col">Status</th>
              <th scope="col">Updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => {
              const isActive = c.id === activeCaseId;
              const isRenaming = renamingId === c.id;
              const isConfirmingDelete = confirmingDeleteId === c.id;

              return (
                <tr
                  key={c.id}
                  className={`case-row ${isActive ? "case-row-active" : ""}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <td>{c.id}</td>
                  <td>
                    {isRenaming ? (
                      <div className="rename-field-group">
                        <label className="visually-hidden" htmlFor={`rename-${c.id}`}>
                          New name for case {c.id}
                        </label>
                        <input
                          id={`rename-${c.id}`}
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          aria-invalid={renameInvalid ? "true" : "false"}
                          aria-describedby={renameInvalid ? `rename-${c.id}-error` : undefined}
                        />
                        {renameInvalid && (
                          <p id={`rename-${c.id}-error`} className="field-error">
                            Case name must be at least 3 characters.
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {c.name}
                        {isActive && <span className="active-indicator"> (Active)</span>}
                      </>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>{new Date(c.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="case-row-actions">
                      {isRenaming ? (
                        <>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => saveRename(c.id)}
                            disabled={renameInvalid}
                            aria-label={`Save new name for case ${c.id}`}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={cancelRename}
                            aria-label={`Cancel rename for case ${c.id}`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : isConfirmingDelete ? (
                        <>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => confirmDelete(c.id)}
                            aria-label={`Confirm delete case ${c.id}`}
                          >
                            Confirm Delete?
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={cancelDeleteConfirm}
                            aria-label={`Cancel delete for case ${c.id}`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => onOpen(c.id)}
                            aria-label={`Open case ${c.id}`}
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => startRename(c)}
                            aria-label={`Rename case ${c.id}`}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => startDeleteConfirm(c.id)}
                            aria-label={`Delete case ${c.id}`}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
