alter table "public"."habits" add column "user_id" uuid;

alter table "public"."habits" add constraint "public_habits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."habits" validate constraint "public_habits_user_id_fkey";

create policy "Enabled for user habits"
on "public"."habit_trackings"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT habits.user_id
   FROM habits
  WHERE (habit_trackings.habit_id = habits.id))));


create policy "Enable insert for users based on user_id"
on "public"."habits"
as permissive
for all
to public
using ((auth.uid() = user_id));



