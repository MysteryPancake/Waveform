
function setup()
    displayMode(FULLSCREEN)
    s2 = sound("Dropbox:Csmooth",0,1,0,true)
    s = sound("Dropbox:Csynth",0,1,0,true)
    x,y,a=0,0,0
    diff = 0
end

function clamp(x)
    if x < 0 then return 0 end
    if x > 255 then return 255 end
    return x
end

function draw()
    background(0)
    tint(255,0,0,a)
    sprite("Documents:glow",x,y,500,500)
    if state=="began" then
        if a<150 then
            a=a+2
        else
            a=clamp(a-2)
        end        
    elseif state=="moving" then
        state="began"
        a=clamp(a+diff)
    elseif state=="ended" then
        a=clamp(a-2)
    end
    
    local thing = CurrentTouch.y/HEIGHT
    s.volume = clamp((a/255)-(1.3-thing))
    s2.volume = clamp((a/255)-thing)
end

function touched(t)
    x,y=t.x,t.y
    diff = math.abs(t.deltaX)+math.abs(t.deltaY)
    s.pitch = (t.x/WIDTH)*2
    s2.pitch = (t.x/WIDTH)*2
    if t.state==BEGAN then
        state="began"
    elseif t.state==MOVING then
        state="moving"
    elseif t.state==ENDED then
        state="ended"
    end        
end