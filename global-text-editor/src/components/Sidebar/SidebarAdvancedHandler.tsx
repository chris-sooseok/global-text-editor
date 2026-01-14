import type { FsNode } from "../../context/FsTreeContext/FsTreeTypes";

export async function deleteFsNode(node: FsNode) {

    const res = await window.api.deleteFsNode(node.id)

    if (res.ok) {
        
    }
}