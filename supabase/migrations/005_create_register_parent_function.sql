-- SECURITY DEFINER function to handle parent registration
-- Bypasses RLS because the registering user is not yet authenticated
-- when validating the invitation and creating the profile.
CREATE OR REPLACE FUNCTION public.register_parent(
    p_code text,
    p_email text,
    p_full_name text,
    p_auth_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation invitations%ROWTYPE;
    v_daycare_id uuid;
BEGIN
    -- Find and lock the invitation
    SELECT *
    INTO v_invitation
    FROM invitations
    WHERE code = p_code
      AND status = 'pending'
      AND expires_at > now()
    FOR UPDATE;

    IF v_invitation IS NULL THEN
        RAISE EXCEPTION 'Código de invitación inválido o expirado';
    END IF;

    -- Validate email matches
    IF v_invitation.email <> p_email THEN
        RAISE EXCEPTION 'El email no coincide con la invitación';
    END IF;

    -- Get daycare_id from the child's room
    SELECT r.daycare_id
    INTO v_daycare_id
    FROM children c
    JOIN rooms r ON r.id = c.room_id
    WHERE c.id = v_invitation.child_id;

    IF v_daycare_id IS NULL THEN
        RAISE EXCEPTION 'Niño no encontrado';
    END IF;

    -- Insert user profile
    INSERT INTO users (id, daycare_id, role, status, full_name)
    VALUES (p_auth_user_id, v_daycare_id, 'parent', 'active', p_full_name);

    -- Mark invitation as accepted
    UPDATE invitations
    SET status = 'accepted',
        accepted_at = now()
    WHERE id = v_invitation.id;

    -- Create parent-child link
    INSERT INTO parent_children (parent_id, child_id, relationship)
    VALUES (p_auth_user_id, v_invitation.child_id, v_invitation.relationship);
END;
$$;

-- Grant execute to anon (needed for registration flow before auth session is established)
GRANT EXECUTE ON FUNCTION public.register_parent(text, text, text, uuid) TO anon, authenticated;
