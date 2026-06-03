
$labels=@(
'release:mvp','release:mdp','release:v1',
'type:epic','type:feature','type:story',
'priority:critical','priority:high','priority:medium','priority:low'
)
foreach($l in $labels){ gh label create $l }
