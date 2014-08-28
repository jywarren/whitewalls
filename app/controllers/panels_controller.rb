class PanelsController < ApplicationController

  def index
    @panels = Panel.find :all
  end

  def show
    @panel = Panel.find(params[:id])
  end

  def edit
    @panel = Panel.find(params[:id])
  end

  # we should limit the # of layers possble
  def save
    @panel = Panel.find params[:id]
    layer = Layer.find(:first,:conditions => {:panel_id => @panel.id, :id => params[:layer_id]})
    layer ||= Layer.new({:panel_id => @panel.id}) 
    layer.img = params[:img]
    layer.save
    render :text => layer.id.to_s+"/"+@panel.layers.collect(&:id).join(',')
  end

  def layers
    @panel = Panel.find params[:id]
    layers = []
    @panel.layers.each do |layer|
      layers << layer.id if layer.updated_at.to_i > params[:last].to_i
    end
    render :text => Time.new.to_i.to_s+'/'+layers.join(',')
  end

  def layer
    @layer = Layer.find(params[:id])
      respond_to do |format|
        format.html { render :text => @layer.img }
        format.png { 
          headers['Content-Type'] = 'image/png'
          headers['Cache-Control'] = 'public'
          headers['Expires'] = 'Mon, 28 Jul 2020 23:30:00 GMT'
          render :text => @layer.img[-23,0]
        }
      end
  end

  def create
    @panel = Panel.new({:name => params[:name]})
    @panel.save!
    redirect_to "/panel/"+@panel.id.to_s
  end

end
